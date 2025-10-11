import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler() {
    try {
        const res = await cloudinary.search
            .expression('folder:galeria')
            .sort_by('created_at', 'desc')
            .max_results(50)
            .execute();

        const formatted = res.resources.map((r) => ({
            url: r.secure_url,
            id: r.public_id,
            type: r.resource_type,
        }));

        return { statusCode: 200, body: JSON.stringify(formatted) };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
