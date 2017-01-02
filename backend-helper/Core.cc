#include <node.h>
#include <nan.h>
#include <string.h>
#include <map>
#include "Validators.h"

NAN_MODULE_INIT(moduleInit) {
    Nan::Set(
        target,
        Nan::New<v8::String>("validateStorageKey").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(validateStorageKey)).ToLocalChecked()
    );
    Nan::Set(
        target,
        Nan::New<v8::String>("validateExtName").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(validateExtName)).ToLocalChecked()
    );
}

NODE_MODULE(CarbonVideoBackendHelper, moduleInit);
