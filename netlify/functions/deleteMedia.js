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
        const { public_id, resource_type } = JSON.parse(event.body || "{}");

        if (!public_id) {
            return {
                statusCode: 400,
                headers: { "access-control-allow-origin": "*" },
                body: JSON.stringify({ error: "Missing public_id" }),
            };
        }

        const type = resource_type === "video" ? "video" : "image";
        const result = await cloudinary.api.delete_resources([public_id], { resource_type: type });

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            body: JSON.stringify({
                deleted: result.deleted,
                resource_type: type,
            }),
        };
    } catch (err) {
        console.error("❌ Error deleting media:", err);
        return {
            statusCode: 500,
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({ error: "Error deleting media" }),
        };
    }
};
