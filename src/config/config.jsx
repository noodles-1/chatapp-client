import AWS from 'aws-sdk'

export const s3 = new AWS.S3({
    region: import.meta.env.VITE_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_SECRET_ACCESS_KEY
    }
})