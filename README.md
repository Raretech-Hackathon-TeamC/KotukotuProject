# Django-ECS

DjangoとuWsgiが繋がる初期状態

# compose up
docker compose -f docker-compose.yml up -d --build

# makemigraitons
docker-compose run app python manage.py makemigrations

# migrate
docker-compose run app python manage.py migrate

# restart
docker-compose -f docker-compose.yml restart app
