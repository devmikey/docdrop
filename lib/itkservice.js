
var client = require('jigsaw/client/client');
var distributionEnvelope = require('jigsaw/messages/distributionEnvelope');

exports.send = function send(manifest, callback) {		
        var msgProperties = {
			"serviceName": "urn:nhs-itk:services:201005:SendDocument-v1-0",
            "key": "./certs/client.pem",
            "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567", "urn:nhs-uk:addressing:ods:Y88764:G1111111"),
                            "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology", "urn:nhs-uk:addressing:ods:R22:oncology"),
                            "manifest": manifest,
                            "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
                          },
            //"url": "http://localhost:3000/simple/clinicaldocuments",	
			"url": "http://devmikey.jigsaw.nodejitsu.com/simple/clinicaldocuments",	
            "handler": callback
        }

    var msg = distributionEnvelope.create(msgProperties);
    client.send(msg);
}