FROM node:12

WORKDIR /jolicitron

COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
COPY test/ test/
RUN npm run build
RUN npm pack .

WORKDIR /app

RUN npm init -y
RUN npm install /jolicitron/jolicitron*.tgz
RUN ./node_modules/.bin/jolicitron 2> actual.txt | echo

RUN /jolicitron/test/bin/test.sh
