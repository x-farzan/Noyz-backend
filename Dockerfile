FROM node:14.18.2-alpine3.13
RUN mkdir -p /farzan
WORKDIR /farzan
COPY package.json .
RUN npm install
COPY . .
ENV email=Noyz.musicapp@gmail.com
ENV SENDGRID_API_KEY=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
ENV host=localhost:5000
ENV aws=http://3.135.18.200:5000
ENV awsId=AKIAZRQFH55VECCRY6HJ
ENV awsSecretKey=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
ENV awsBucketName=noyz-backend
ENV port=5000
ENV mongodb=mongodb+srv://Farzan:qcrntyazi85Mv1Ml@cluster0.1rh7i.mongodb.net/Noyz?retryWrites=true&w=majority
ENV jwtKey=testing
ENV cloudName=dl5wiq8xh
ENV apiKey=839394856955895
ENV apiSecretKey=Jrvcc6mS2-kpTiHmZoVGh_WFKBo
ENV pinatakey1="34975f0901040987f279"
ENV pinatakey2="6e83cfefd5550051b16e33ccbc1488291887a679bb799408ff787521f2378375"
EXPOSE 5000
CMD ["node", "server.js"]