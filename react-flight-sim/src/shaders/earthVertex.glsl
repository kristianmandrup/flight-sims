// Uniforms: Values passed from JavaScript/React
uniform sampler2D heightMap;       // The grayscale height texture
uniform float displacementScale; // How much to displace based on height

// Varying: Data passed from Vertex to Fragment Shader
varying vec2 vUv;           // UV coordinates for texture sampling in fragment shader
varying vec3 vWorldNormal;    // Normal vector in world space for lighting
varying vec3 vWorldPosition;  // Vertex position in world space

void main() {
    vUv = uv; // Pass UV coordinates to fragment shader

    // Sample the heightmap - texture2D(sampler, uv).channel
    // We use '.r' assuming height is in the red channel of a grayscale image
    float height = texture2D(heightMap, uv).r;

    // Calculate displacement vector: normal scaled by height and scale factor
    // 'normal' is the local normal of the sphere vertex
    vec3 displacement = normal * height * displacementScale;

    // Calculate the new vertex position in model space
    vec3 displacedPosition = position + displacement;

    // Calculate world position and normal for lighting in fragment shader
    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    // Transform the normal vector into world space
    // Use the inverse transpose of the model matrix for correct normal scaling
    vWorldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal); // Faster than inverse transpose for uniform scaling/rotation

    // Standard final position calculation
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}