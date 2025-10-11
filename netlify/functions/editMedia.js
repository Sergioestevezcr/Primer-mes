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
        const { public_id, resource_type, caption, tags } = JSON.parse(event.body || "{}");

        if (!public_id) {
            return {
                statusCode: 400,
                headers: { "access-control-allow-origin": "*" },
                body: JSON.stringify({ error: "Missing public_id" }),
            };
        }

        const updateData = {};

        // Guardar descripción como context.custom.caption
        if (caption !== undefined) {
            updateData.context = { custom: { caption } };
        }

        // Actualizar etiquetas
        if (Array.isArray(tags)) {
            updateData.tags = tags;
        }

        // Ejecutar actualización
        const result = await cloudinary.api.update(public_id, {
            ...updateData,
            resource_type: resource_type || "image",
        });

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            body: JSON.stringify({
                public_id: result.public_id,
                secure_url: result.secure_url,
                resource_type: result.resource_type,
                context: result.context || {},
                tags: result.tags || [],
            }),
        };
    } catch (err) {
        console.error("❌ Error updating media:", err);
        return {
            statusCode: 500,
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({ error: "Error updating media" }),
        };
    }
};
