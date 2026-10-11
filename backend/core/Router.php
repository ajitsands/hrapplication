<?php
// backend/core/Router.php

namespace App\Core;

class Router {
    private array $routes = [];
    private array $middlewares = [];
    
    public function add(string $method, string $path, $handler, array $middlewares = []): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $this->normalizePath($path),
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }
    
    public function get(string $path, $handler, array $middlewares = []): void {
        $this->add('GET', $path, $handler, $middlewares);
    }
    
    public function post(string $path, $handler, array $middlewares = []): void {
        $this->add('POST', $path, $handler, $middlewares);
    }
    
    public function put(string $path, $handler, array $middlewares = []): void {
        $this->add('PUT', $path, $handler, $middlewares);
    }
    
    public function delete(string $path, $handler, array $middlewares = []): void {
        $this->add('DELETE', $path, $handler, $middlewares);
    }
    
    private function normalizePath(string $path): string {
        $path = trim($path, '/');
        return $path === '' ? '/' : '/' . $path;
    }
    
    public function dispatch(string $requestUri, string $requestMethod): void {
        $parsedUri = parse_url($requestUri, PHP_URL_PATH);
        
        // Remove script subpath if running in a subdirectory or standard URL
        $scriptName = dirname($_SERVER['SCRIPT_NAME']);
        if ($scriptName !== '/' && $scriptName !== '\\' && strpos($parsedUri, $scriptName) === 0) {
            $parsedUri = substr($parsedUri, strlen($scriptName));
        }
        
        $uri = $this->normalizePath($parsedUri);
        $method = strtoupper($requestMethod);
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            // Convert route pattern with {param} to regex
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';
            
            if (preg_match($pattern, $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Execute Middlewares
                $user = null;
                foreach ($route['middlewares'] as $middlewareClass) {
                    if (is_callable($middlewareClass)) {
                        $middlewareClass();
                    } elseif (class_exists($middlewareClass)) {
                        $mw = new $middlewareClass();
                        $user = $mw->handle();
                    }
                }
                
                // Execute Handler
                if (is_callable($route['handler'])) {
                    call_user_func_array($route['handler'], [$params, $user]);
                    return;
                }
                
                if (is_array($route['handler'])) {
                    [$controllerClass, $action] = $route['handler'];
                    if (class_exists($controllerClass)) {
                        $controller = new $controllerClass();
                        if ($user && method_exists($controller, 'setAuthUser')) {
                            $controller->setAuthUser($user);
                        }
                        if (method_exists($controller, $action)) {
                            call_user_func_array([$controller, $action], [$params]);
                            return;
                        }
                    }
                }
            }
        }
        
        // No route matched
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => "Route not found: [$method] $uri"
        ]);
    }
}
