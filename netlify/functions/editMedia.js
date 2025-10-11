const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method not allowed" };
    }
    try {
        const { id, caption, tags } = JSON.parse(event.body || "{}");
        if (!id) {
            return { statusCode: 400, body: "Missing id" };
        }

        const payload = {};
        if (caption !== undefined) payload.context = { caption };
        if (Array.isArray(tags)) payload.tags = tags;

        const result = await cloudinary.api.update(id, payload);

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            body: JSON.stringify({
                public_id: result.public_id,
                context: result.context || null,
                tags: result.tags || [],
                resource_type: result.resource_type,
                secure_url: result.secure_url,
            }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({ error: "Error updating media" }),
        };
    }
};
