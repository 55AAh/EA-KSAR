Deployment on Ubuntu:

1. Install Docker via the official guide: https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

2. Build Oracle Database 19.3c image :

   1. `sudo mkdir -p /opt/oracle && cd /opt/oracle`
   2. `sudo git clone https://github.com/oracle/docker-images` (or download and extract zip).
   3. `cd docker-images/OracleDatabase/SingleInstance/dockerfiles/19.3.0`
   4. Download ZIP for `Oracle Database 19c for Linux x86-64` (requires login to Oracle account) into the current folder (without extracting).
   5. `sudo docker build -t oracle/database:19.3.0-ee --build-arg DB_EDITION=ee . --build-arg http_proxy=$http_proxy --build-arg https_proxy=$https_proxy`

3. Move the image to the target server:

   1. `sudo docker save oracle/database:19.3.0-ee | gzip > oracledb-19.3.0-ee.tar.gz`
   2. ...copy file to the target server...
   3. `sudo docker load -i oracledb-19.3.0-ee.tar.gz`

4. Create folder for persistent db storage:

   1. `sudo mkdir -p /opt/oracle/oradata`
   2. `sudo chmod -R a+w /opt/oracle/oradata`

5. Setup db container:

   ```shell
   sudo docker run --name oracle19.3c \
    -p 1521:1521 -p 5500:5500 \
    -e ORACLE_SID=KSAR \
    -e ORACLE_PDB=KSAR_PDB \
    -v /opt/oracle/oradata:/opt/oracle/oradata \
    --restart unless-stopped \
    --stop-timeout 90 \
    oracle/database:19.3.0-ee
   ```

6. Wait until the `DATABASE IS READY TO USE` message appears, then press `Ctrl+C`

7. Change master password: `sudo docker exec oracle19.3c ./setPassword.sh YOUR_PASSWORD`

8. Start the container:

   ```shell
   sudo docker start oracle19.3c
   ```

9. Enable Docker to start automatically on boot:
   ```shell
   sudo systemctl enable docker.service && sudo systemctl enable containerd.service
   ```
