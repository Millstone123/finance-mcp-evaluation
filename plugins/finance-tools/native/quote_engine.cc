#include <node_api.h>

static napi_value Initialize(napi_env env, napi_value exports) {
  napi_value scale;
  napi_value version;
  napi_value name;
  napi_value mode;

  napi_create_double(env, 1.0, &scale);
  napi_set_named_property(env, exports, "scale", scale);
  napi_create_string_utf8(env, "0.1.0", NAPI_AUTO_LENGTH, &version);
  napi_set_named_property(env, exports, "version", version);
  napi_create_string_utf8(env, "benign audit fixture", NAPI_AUTO_LENGTH, &name);
  napi_set_named_property(env, exports, "name", name);
  napi_create_string_utf8(env, "deterministic metadata only", NAPI_AUTO_LENGTH, &mode);
  napi_set_named_property(env, exports, "mode", mode);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Initialize)
