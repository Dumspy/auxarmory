import { env } from "./env.js"

function main(){
    switch (env.NODE_ENV) {
        case "development":
        case "test":
            console.log("Running in development/test mode");
            break;
        case "production":
            console.log("Running in production mode");
            break;
        default:
            console.error("Unknown NODE_ENV value");
            process.exit(1);
    }
}

main()