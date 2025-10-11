import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event) {
    try {
        const body = JSON.parse(event.body);
        const file = body.file;
        const folder = body.folder || 'galeria';

        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'auto',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                url: result.secure_url,
                public_id: result.public_id,
                type: result.resource_type,
            }),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
