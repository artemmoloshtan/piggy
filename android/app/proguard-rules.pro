# ProGuard rules for Piggy Android App
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class cz.piggy.calculator.WebAppInterface { *; }
