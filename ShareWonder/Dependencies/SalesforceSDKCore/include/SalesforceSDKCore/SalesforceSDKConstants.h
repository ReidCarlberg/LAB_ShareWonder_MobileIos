#ifndef SalesforceSDKConstants_h
#define SalesforceSDKConstants_h

#define SALESFORCE_SDK_IS_PRODUCTION_VERSION NO

#define SALESFORCE_SDK_BUILD_IDENTIFIER @"unstable"

#define __SALESFORCE_SDK_2_0_0 20000

#define SALESFORCE_SDK_VERSION_MIN_REQUIRED __SALESFORCE_SDK_2_0_0

#define SALESFORCE_SDK_VERSION [NSString stringWithFormat:@"%d.%d.%d%@",              \
                                (SALESFORCE_SDK_VERSION_MIN_REQUIRED / 10000),        \
                                (SALESFORCE_SDK_VERSION_MIN_REQUIRED % 10000) / 100,  \
                                (SALESFORCE_SDK_VERSION_MIN_REQUIRED % 10000) % 100,  \
                                (SALESFORCE_SDK_IS_PRODUCTION_VERSION ? @"" : SALESFORCE_SDK_BUILD_IDENTIFIER)]

#define FIX_CATEGORY_BUG(name) @interface FIXCATEGORYBUG ## name @end @implementation FIXCATEGORYBUG ## name @end
#define SFRelease(ivar) ivar = nil;

#ifdef __clang__
#define SFSDK_DEPRECATED(version, msg) __attribute__((deprecated("Deprecated in Salesforce Mobile SDK " #version ". " msg)))
#else
#define SFSDK_DEPRECATED(version, msg) __attribute__((deprecated()))
#endif

#endif // SalesforceSDKConstants_h