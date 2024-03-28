const express = require('express');
const app = express();

const { Web3 } = require('web3');
const infuraUrl = "https://sepolia.infura.io/v3/2a5309849a3b4bdb8f702969c17dd3cb";
const web3 = new Web3(infuraUrl);

const planet_abi = require("./planet/PlanetNFTABI.json");
const abi = planet_abi;
const contractAddress = "0xE37c702F98134183baCC3d4EA229BB03c7cC182d"; // 자신의 컨트랙트 주소
const planetContract = new web3.eth.Contract(abi, contractAddress);
const privateKey = "7da1571d757f5c55fd8072f099168804c0a6ff6fa2c5d0171b896df411907031";
// Creating a signing account from a private key

// JSON 형식의 요청 본문 파싱
app.use(express.json());
//--------------------------------------------------------------
//--------------------------------------------------------------

var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server is working : PORT - ',port);
    console.log('Server is working : HOST - ',host);
    console.log("Listening...");

});

//--------------------------------------------------------------
//--------------------------------------------------------------
app.post('/setSaleActive', async function(req, res){
    let flag = req.body.flag;

    await fn_setSaleActive(flag);

    console.log('over...');
    res.send({"result":true});
});
async function fn_setSaleActive(_flag){

    //--
    const from = "0x9C64F3c4e8f5804E9be78529c7C76d3b826043bc";
    const nonce = await web3.eth.getTransactionCount(from);
    const networkId = web3.eth.net.getId;
    //abi
    //contractAddress

    // 서명된 트랜잭션을 생성
    const txObject = {
        from: from,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(1000000000), // 예시로 200000으로 설정
        value: '0x0',
        data: planetContract.methods.setSaleActive(_flag).encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    // 서명된 트랜잭션을 블록체인 네트워크로 전송
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('setSaleActive 함수 호출 성공:', receipt);
    //--


    console.log('트랜잭션 결과:', receipt);

    //call로 변경 확인
    const final = await planetContract.methods.isSalesActive().call();
    console.log('final : '+final);

    return;
    
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.post('/mint', async function(req, res){
    let num = req.body.userId;
    let type = req.body.type;

    let userAddress = fn_whois(num);

    await fn_mint(userAddress, type);

    console.log('over...');
    res.send({"result":true});
});
async function fn_mint(_targetAddress, _type) {
    // userId 값이 필요하다면 여기에서 사용 가능
    console.log('mint() 함수가 실행되었습니다.');

    const from = "0x9C64F3c4e8f5804E9be78529c7C76d3b826043bc";
    const nonce = await web3.eth.getTransactionCount(from);
    const networkId = web3.eth.net.getId;
    //abi
    //contractAddress

    // 서명된 트랜잭션을 생성
    const txObject = {
        from: from,
        to: contractAddress,
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(1000000000), // 예시로 200000으로 설정
        value: '0x0',
        data: planetContract.methods.mintPlanet(_targetAddress, _type).encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    // 서명된 트랜잭션을 블록체인 네트워크로 전송
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('mintPlanet 함수 호출 성공:', receipt);
    return;
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.get("/isSalesActive", (req, res) => {
    isSalesActive().then((result) => {
        res.send(result);
    });
});
async function isSalesActive() {

    console.log('func start');

    const result1 = await planetContract.methods.helloworld().call();
    const result2 = await planetContract.methods.isSalesActive().call();
    const result3 = await planetContract.methods.name().call();
    const result4 = await planetContract.methods.tokenURI(1).call();

    console.log(result1);
    console.log(result2);
    console.log(result3);
    console.log(result4);


}
//--------------------------------------------------------------
//--------------------------------------------------------------

function fn_whois(_num){
    var userAddress;

    switch (_num) {
        case 1:
            console.log("숫자 1을 처리합니다.");
            // 여기에 숫자 1을 처리하는 코드를 추가합니다.
            userAddress = "0x2148B78C48D78A1D8C9A0C314A90b46F113B460d";
            break;
        case 2:
            console.log("숫자 2를 처리합니다.");
            // 여기에 숫자 2를 처리하는 코드를 추가합니다.
            userAddress = "0x632F2032d8E53c3A5F51f3100b73463259Caa1a3";
            break;
        case 3:
            console.log("숫자 3을 처리합니다.");
            // 여기에 숫자 3을 처리하는 코드를 추가합니다.
            userAddress = "0xF9bf08d8d1f86799D766A12CB32ACEa5b16D410d";
            break;
        case 4:
            console.log("숫자 4를 처리합니다.");
            // 여기에 숫자 4를 처리하는 코드를 추가합니다.
            userAddress = "0x1Cf38CF01686d75539ae295c7276DF196464d471";
            break;
        // default:
        //     console.log("해당하는 경우가 없습니다.");
            // 만약 num이 1, 2, 3, 4 중에 없는 경우에 실행될 코드를 추가합니다.
           // break;
    }

    return userAddress;
}