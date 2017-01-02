#include <node.h>
#include <nan.h>

static bool validStorageKeyCharTable[256];
static bool validExtNameCharTable[256];

static bool isInitialized = false;

static void initCharTables() {
    bzero(validStorageKeyCharTable, 256);
    for(int i = '0'; i <= '9'; i++) validStorageKeyCharTable[i] = true;
    for(int i = 'a'; i <= 'z'; i++) validStorageKeyCharTable[i] = true;
    for(int i = 'A'; i <= 'Z'; i++) validStorageKeyCharTable[i] = true;
    validStorageKeyCharTable['/'] = true;
    validStorageKeyCharTable['.'] = true;
    validStorageKeyCharTable['-'] = true;
    validStorageKeyCharTable['_'] = true;

    bzero(validExtNameCharTable, 256);
    for(int i = '0'; i <= '9'; i++) validExtNameCharTable[i] = true;
    for(int i = 'a'; i <= 'z'; i++) validExtNameCharTable[i] = true;
    for(int i = 'A'; i <= 'Z'; i++) validExtNameCharTable[i] = true;
}

static void init() {
    if(isInitialized) return;
    isInitialized = true;

    initCharTables();
}

NAN_METHOD(validateStorageKey) {
    init();

    if(
        info.Length() != 1
        || !info[0] -> IsString()
    ) {
        info.GetReturnValue().Set(false);
        return;
    }

    v8::String::Utf8Value _key(info[0] -> ToString());
    const char *key = *_key;

    if(!key) {
        info.GetReturnValue().Set(false);
        return;
    }
    unsigned int keyLength = strlen(key);
    if(keyLength == 0 || keyLength > 128) {
        info.GetReturnValue().Set(false);
        return;
    }

    for(const char *ch = key; *ch; ch++) {
        if(!validStorageKeyCharTable[(int) *ch]) {
            info.GetReturnValue().Set(false);
            return;
        }
    }

    info.GetReturnValue().Set(true);
}

NAN_METHOD(validateExtName) {
    init();
    
    if(
        info.Length() != 1
        || !info[0] -> IsString()
    ) {
        info.GetReturnValue().Set(false);
        return;
    }

    v8::String::Utf8Value _extName(info[0] -> ToString());
    const char *extName = *_extName;

    if(!extName) {
        info.GetReturnValue().Set(false);
        return;
    }
    unsigned int extNameLength = strlen(extName);
    if(extNameLength == 0 || extNameLength > 32) {
        info.GetReturnValue().Set(false);
        return;
    }

    for(const char *ch = extName; *ch; ch++) {
        if(!validExtNameCharTable[(int) *ch]) {
            info.GetReturnValue().Set(false);
            return;
        }
    }

    info.GetReturnValue().Set(true);
}
