// Uniforms
uniform sampler2D colorMap;       // The base color texture
uniform vec3 pointLightPos;      // Position of the sun/light source in world space
uniform vec3 pointLightColor;    // Color of the sun/light
uniform vec3 ambientLightColor;  // Ambient light color

// Varying: Data received from Vertex Shader
varying vec2 vUv;           // UV coordinates
varying vec3 vWorldNormal;    // Interpolated normal vector in world space
varying vec3 vWorldPosition;  // Interpolated vertex position in world space

void main() {
    // Sample the base color texture
    vec4 baseColor = texture2D(colorMap, vUv);

    // --- Basic Point Light Calculation (Diffuse only) ---
    vec3 lightDirection = normalize(pointLightPos - vWorldPosition); // Direction from surface point to light
    vec3 normal = normalize(vWorldNormal);                         // Ensure normal is normalized after interpolation

    // Calculate diffuse factor (dot product, clamped at 0)
    float diffuseFactor = max(dot(normal, lightDirection), 0.0);

    // Calculate final diffuse light color
    vec3 diffuseLight = pointLightColor * diffuseFactor;

    // --- Combine Lighting ---
    // Add ambient light and diffuse light, then multiply by base color
    vec3 finalColor = (ambientLightColor + diffuseLight) * baseColor.rgb;

    // Output the final color
    gl_FragColor = vec4(finalColor, 1.0);

    // --- Optional: Add Specular ---
    // vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    // vec3 reflectDirection = reflect(-lightDirection, normal);
    // float specFactor = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0); // Shininess factor = 32
    // vec3 specularLight = pointLightColor * specFactor;
    // gl_FragColor = vec4((ambientLightColor + diffuseLight + specularLight) * baseColor.rgb, 1.0);
}