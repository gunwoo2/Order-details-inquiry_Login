sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/m/Bar",
    "sap/m/Label",
    "sap/ui/core/Icon"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Dialog, Button, Text, MessageToast, Bar, Label, Icon) {
        "use strict";

        return Controller.extend("sync.ea.orderlogin.controller.Login", {
            onInit: function () {
                this.isFirst = true;
            },
            onAfterRendering: function () {
                if (!this.isFirst) {
                    return;
                }
            
                this.isFirst = false;
            
                var sFilePath1 = "https://asset.hankooktire.com/content/dam/hankooktire/global/video/main/LC_kinergy_1920_970_230523.mp4#t=0.1"; // idHTML에 적용할 비디오 파일 경로
                var oHTML1 = this.getView().byId("idHTML");
                
                var sContent1 = `
                    <video autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;">
                        <source src="${sFilePath1}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;            
                oHTML1.setContent(sContent1);
            },

            onSearch: function () {
                var oView = this.getView();
                var sTelno = oView.byId("TelnoInput").getValue(); // 핸드폰 번호 입력란에서 값을 가져옴
    
                if (!sTelno) {
                    this._showDialog("핸드폰 번호를 입력해 주세요.");
                    return;
                }

                // 숫자만 포함되어 있는지 확인
                var isNumeric = /^\d+$/.test(sTelno);
                if (!isNumeric) {
                    this._showDialog("⚠ 특수문자 없이 숫자만 입력해주세요.");
                    return;
                }
    
                var oModel = this.getView().getModel();
                var sPath = "/OrderHistorySet";
    
                // 네트워크 요청 전에 로딩 메시지 표시
                MessageToast.show("주문 조회 중...");
    
                oModel.read(sPath, {
                    success: function (oData) {
                        console.log("응답 데이터:", oData);
                        if (oData && oData.results) {
                            var bFound = oData.results.some(function (oOrder) {
                                console.log("주문 데이터:", oOrder);
                                return oOrder.Telno === sTelno; // 핸드폰 번호 필드명을 Telno로 확인
                            });
    
                            if (bFound) {
                                var sRedirectURL = "https://edu.bgis.co.kr:8443/sap/bc/ui2/flp#synceaorderview-display&/Number/" + sTelno;
                                this._showDialog("주문 조회 성공", "loginSuccessButton", sRedirectURL);
                                // 주문 조회 성공 후의 동작을 여기에 추가합니다.
                            } else {
                                this._showDialog("주문 상품 없음");
                            }
                        } else {
                            this._showDialog("데이터를 가져오는 데 실패했습니다. 서버 응답을 확인하세요.");
                        }
                    }.bind(this),
                    error: function (oError) {
                        var sErrorMessage = "주문 조회 중 오류가 발생했습니다.";
                        if (oError && oError.message) {
                            sErrorMessage += " " + oError.message;
                        }
                        this._showDialog(sErrorMessage);
    
                        // 추가로 오류 객체를 콘솔에 출력하여 상세한 오류 메시지를 확인합니다.
                        console.error(oError);
                    }.bind(this)
                });
            },
    
            _showDialog: function (sMessage, sButtonId, sRedirectURL) {
                var oDialog = new Dialog({
                    customHeader: new Bar({
                        contentMiddle: [
                            new Icon({
                                src: "sap-icon://message-information",
                                size: "1.5rem",
                                class: "sapUiTinyMarginEnd"
                            }),
                            new Label({
                                text: "알림",
                                design: "Bold"
                            })
                        ]
                    }),
                    type: "Message",
                    state: "None",
                    content: new Text({ text: sMessage }),
                    beginButton: new Button({
                        id: sButtonId,
                        text: "확인",
                        press: function () {
                            oDialog.close();
                            if (sButtonId === "loginSuccessButton") {
                                MessageToast.show("주문정보를 조회중입니다"); // 로딩 중임을 알리는 메시지 표시
                                setTimeout(function () {
                                    window.location.href = sRedirectURL; // 2초 후에 URL로 리다이렉션
                                }, 2000);
                            }
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });
            
                oDialog.open();
            }
        });
    });
