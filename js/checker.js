    function environmentalDetectionCallback(result) {
        //alert(result.checksPassed ? 'Passed ' : 'Failed. ' + result.failureReasonString);
        console.log(result);
    }
    var _RealeyesitEnvDetectParams = _RealeyesitEnvDetectParams || {};
    _RealeyesitEnvDetectParams._callback = environmentalDetectionCallback;
    (function() {
        var envDetect = document.createElement('script');
        envDetect.type = 'text/javascript';
        envDetect.async = true;
        envDetect.src = 'https://codesdwncdn.realeyesit.com/environment-checker/Realeyesit.EnvironmentalDetectionAPI.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(envDetect, s);
    })();
