# Django-ECS

DjangoとuWsgiが繋がる初期状態

### compose up
docker compose -f docker-compose.yml up -d --build

### makemigraitons
docker-compose run app python manage.py makemigrations

### migrate
docker-compose run app python manage.py migrate

### restart
docker-compose -f docker-compose.yml restart app

### make admin account
./.migration.sh

※起動後、管理画面にて名言・実績を登録する必要があります
