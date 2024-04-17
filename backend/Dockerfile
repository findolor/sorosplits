# > 1. OS SET UP --
FROM ubuntu:22.04

# > 1.a -- Install various essential dependencies
RUN apt-get update && apt-get install -y curl gnupg zip unzip

# > 1.b Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# > 1.c Install BunJS
ENV BUN_INSTALL=$HOME/bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH=$PATH:$HOME/bun/bin

# > 2. PROJECT SET UP --
# > 2.a -- Set up working directory for the project 
WORKDIR /app

# > 2.b -- Copy essential dependency specification files
COPY package.json .
COPY bun.lockb .
COPY tsconfig.json .
COPY prisma prisma
COPY sorosplits-sdk.tgz sorosplits-sdk.tgz

# > 2.c -- Install dependencies
RUN bun install

# > 2.d -- Run prisma codegen
RUN bunx prisma generate

# > 2.e -- Copy essential files and folders
COPY src src

# > 2.f -- Set up various environment variables
ENV PORT 8080

# > 3. RUN PROJECT --
# > 3.a -- Expose various ports as necessary
EXPOSE 8080

# > 3.b -- Run
CMD ["bun", "dev"]