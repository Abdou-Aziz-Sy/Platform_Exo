import multiprocessing

# Configuration des workers
workers = 2  # Réduit de 4 à 2 pour limiter la consommation de mémoire
worker_class = 'uvicorn.workers.UvicornWorker'
worker_connections = 1000
timeout = 120  # Augmente le timeout à 120 secondes

# Configuration des timeouts
keepalive = 65
graceful_timeout = 120

# Configuration de la mémoire
max_requests = 1000
max_requests_jitter = 50

# Configuration des logs
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Configuration du binding
bind = '0.0.0.0:$PORT' 