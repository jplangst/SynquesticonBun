FROM oven/bun:1.1
WORKDIR /app
COPY . .
RUN bun install 
     
ARG PORT
EXPOSE 5137
     
CMD ["bun", "run", "start"]