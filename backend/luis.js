/*
 Copyright (c) Microsoft. All rights reserved.
 Licensed under the MIT license.

 Microsoft Cognitive Services (formerly Project Oxford): https://www.microsoft.com/cognitive-services


 Microsoft Cognitive Services (formerly Project Oxford) GitHub:
 https://github.com/Microsoft/ProjectOxford-ClientSDK


 Copyright (c) Microsoft Corporation
 All rights reserved.

 MIT License:
 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const LUISClient = require('luis-sdk');

const APPID = "f6ac17e7-fc45-44c7-9a16-e1de20b4d1b1";
const APPKEY = "55a873ef410743fea3fea12d1ac34c72";

const LUISclient = LUISClient({
    appId: APPID,
    appKey: APPKEY,
    verbose: false
});

function callLuis(text) {
    new Promise((resolve, reject) => {
            LUISclient.predict(text, {
                //On success of prediction
                onSuccess: response => {
                    resolve(response);
                },

                //On failure of prediction
                onFailure: err => {
                    reject(err);
                }
            });
        }
    )
}

module.exports = { callLuis };
