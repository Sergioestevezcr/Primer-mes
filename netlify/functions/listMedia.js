const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async () => {
    try {
        const res = await cloudinary.search
            .expression("(resource_type:image OR resource_type:video)")
            .sort_by("created_at", "desc")
            .with_field("context")
            .with_field("tags")
            .max_results(200)
            .execute();

        const mapped = (res.resources || []).map(r => {
            const isVideo = r.resource_type === "video";
            const thumb = isVideo
                ? cloudinary.url(r.public_id, {
                    resource_type: "video",
                    format: "jpg",
                    transformation: [{ width: 600, crop: "limit" }],
                })
                : r.secure_url;

            return {
                public_id: r.public_id, // 👈 ESTE ES EL ID QUE NECESITA TU JS
                secure_url: r.secure_url,
                resource_type: r.resource_type,
                tags: r.tags || [],
                context: r.context || {},
                thumbnail_url: thumb,
                created_at: r.created_at,
            };
        });

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            body: JSON.stringify(mapped),
        };
    } catch (err) {
        console.error("❌ Error listando medios:", err);
        return {
            statusCode: 500,
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({ error: "Error listing media" }),
        };
    }
};
