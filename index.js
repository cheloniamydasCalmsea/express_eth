const express = require('express');
const app = express();
const axios = require('axios');
const commonJs = require('./ethseoul/func/common');

const { Web3 } = require('web3');
const infuraUrl = "https://sepolia.infura.io/v3/2a5309849a3b4bdb8f702969c17dd3cb";
const web3 = new Web3(infuraUrl);
//--------------------------------------------------------------
//--------------------------------------------------------------
/*abi*/
const cerealNFT_ABI = require("./planet/CerealNFT_ABI.json");
const cerealSBT_ABI = require("./planet/CerealSBT_ABI.json");

/*address*/
const cerealNFT_address = "0x7458C46785ed4EeC78f544655173feD8ac8E84b2"; // 자신의 컨트랙트 주소
const cerealSBT_address = "0x0E615b882cb9223A7f1C10064F0589ca084F6750"; 

/*contract*/
const cerealNFT_contract = new web3.eth.Contract(cerealNFT_ABI, cerealNFT_address);
const cerealSBT_contract = new web3.eth.Contract(cerealSBT_ABI, cerealSBT_address);
//--------------------------------------------------------------
//--------------------------------------------------------------
const privateKey = "7da1571d757f5c55fd8072f099168804c0a6ff6fa2c5d0171b896df411907031";
// Creating a signing account from a private key

// JSON 형식의 요청 본문 파싱
app.use(express.json());
//--------------------------------------------------------------
//--------------------------------------------------------------
/* main */
var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server is working : PORT - ',port);
    console.log('Server is working : HOST - ',host);
    console.log("Listening...");

});
//--------------------------------------------------------------
//--------------------------------------------------------------
app.post('/nft/mint', async function(req, res){
    let num = req.body.userId;
    let type = req.body.type;

    let userAddress = commonJs.fn_whois(num);

    await fn_nft_mint(userAddress, type);
    
    console.log('over...');
    res.send({"result":true});
});
async function fn_nft_mint(_targetAddress, _type) {
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
        to: cerealNFT_address,
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(1000000000), // 예시로 200000으로 설정
        value: '0x0',
        data: cerealNFT_contract.methods.mintPlanet(_targetAddress, _type).encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    // 서명된 트랜잭션을 블록체인 네트워크로 전송
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('mintPlanet 함수 호출 성공:', receipt);
    return;
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.get('/nft/:userSeq', async function(req, res) {
  //let num = req.params.userId;
  const str = req.params.userSeq;

  //userId mapping
  let userAddress = commonJs.fn_whois(str);
  // userId와 tokenId를 사용하여 필요한 로직 수행
  // 예시: userId와 tokenId에 해당하는 SBT 정보 조회
  const result = await fn_NFT_Info_ALL(userAddress);

  // 결과 반환
  res.send({ "result" : result });
});
async function fn_NFT_Info_ALL(_userWalletId) {
  console.log("_userWalletId : "+_userWalletId);
  let result;

  try {
      const bigIntArray = await cerealNFT_contract.methods.getOwnedTokens(_userWalletId).call();
      const data = [];
      console.log(bigIntArray);

      const intArray = bigIntArray.map(bigInt => Number(bigInt));
      console.log(intArray);

      for (let i = 0; i < intArray.length; i++) {
          
          const tokenURI = await cerealNFT_contract.methods.tokenURI(intArray[i]).call();
  
          // IPFS 프로토콜을 HTTP 프로토콜로 변경
          const httpURI = tokenURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
  
         // HTTP 요청을 보내 JSON 데이터 가져오기
          const response = await axios.get(httpURI);
          const jsonData = response.data;

          console.log(jsonData);
          const levelStr = jsonData.attributes.find(attr => attr.trait_type === 'level').value;


          data.push({
              tokenId: intArray[i],
              level: levelStr
            });
          console.log('-------');
      }

      result = {
          totalCnt: intArray.length,
          data: data
        };

    } catch (error) {
      console.error('Error:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }

  return result;
// 함수 내용
}

//--------------------------------------------------------------
//--------------------------------------------------------------
app.get('/nft/token/:tokenId', async function(req, res) {
  //let num = req.params.userId;
  const tokenId = req.params.tokenId;

  //userId mapping
  //let userAddress = fn_whois(num);
  // userId와 tokenId를 사용하여 필요한 로직 수행
  // 예시: userId와 tokenId에 해당하는 SBT 정보 조회
  const imageURI = await fn_NFT_Info(tokenId);

  // 결과 반환
  res.send({ "result" : imageURI });
});
async function fn_NFT_Info(_tokenId) {
  let httpImageURI;

  try {
      const tokenURI = await cerealNFT_contract.methods.tokenURI(_tokenId).call();
  
      // IPFS 프로토콜을 HTTP 프로토콜로 변경
      const httpURI = tokenURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
  
      // HTTP 요청을 보내 JSON 데이터 가져오기
      const response = await axios.get(httpURI);
      const jsonData = response.data;
  
      // image 값 추출
      const imageURI = jsonData.image;
  
      // image URI에서 IPFS 프로토콜을 HTTP 프로토콜로 변경
      httpImageURI = imageURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
      console.log('httpImageURI : '+httpImageURI);
      // 결과 반환
      //res.send({ "result": httpImageURI });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }

  return httpImageURI;
// 함수 내용
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.post('/sbt/mint', async function(req, res){
    let num = req.body.userId;
    let type = req.body.type;

    let userAddress = commonJs.fn_whois(num);

    await fn_sbt_mint(userAddress, type);
    
    console.log('over...');
    res.send({"result":true});
});
async function fn_sbt_mint(_targetAddress, _type) {
    // userId 값이 필요하다면 여기에서 사용 가능
    console.log('mint() 함수가 실행되었습니다.');
    console.log('userAddress : '+_targetAddress);

    const from = "0x9C64F3c4e8f5804E9be78529c7C76d3b826043bc";
    const nonce = await web3.eth.getTransactionCount(from);
    const networkId = web3.eth.net.getId;
    //abi
    //contractAddress

    // 서명된 트랜잭션을 생성
    const txObject = {
        from: from,
        to: cerealSBT_address,
        nonce: web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(1000000000), // 예시로 200000으로 설정
        value: '0x0',
        data: cerealSBT_contract.methods.mint(_targetAddress, _type).encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    // 서명된 트랜잭션을 블록체인 네트워크로 전송
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('mintPlanet 함수 호출 성공:', receipt);
    return;
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.get('/sbt/:userSeq', async function(req, res) {
    //let num = req.params.userId;
    const str = req.params.userSeq;
  
    //userId mapping
    let userAddress = commonJs.fn_whois(str);
    // userId와 tokenId를 사용하여 필요한 로직 수행
    // 예시: userId와 tokenId에 해당하는 SBT 정보 조회
    const result = await fn_SBT_Info_ALL(userAddress);
  
    // 결과 반환
    res.send({ "result" : result });
});
async function fn_SBT_Info_ALL(_userWalletId) {
    console.log("_userWalletId : "+_userWalletId);
    let result;

    try {
        const bigIntArray = await cerealSBT_contract.methods.getOwnedTokens(_userWalletId).call();
        const data = [];
        console.log(bigIntArray);

        const intArray = bigIntArray.map(bigInt => Number(bigInt));
        console.log(intArray);

        for (let i = 0; i < intArray.length; i++) {
            
            const tokenURI = await cerealSBT_contract.methods.tokenURI(intArray[i]).call();
    
            // IPFS 프로토콜을 HTTP 프로토콜로 변경
            const httpURI = tokenURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
    
           // HTTP 요청을 보내 JSON 데이터 가져오기
            const response = await axios.get(httpURI);
            const jsonData = response.data;

            console.log(jsonData);
            const levelStr = jsonData.attributes.find(attr => attr.trait_type === 'level').value;


            data.push({
                tokenId: intArray[i],
                level: levelStr
              });
            console.log('-------');
        }

        result = {
            totalCnt: intArray.length,
            data: data
          };

      } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }

    return result;
  // 함수 내용
}

//--------------------------------------------------------------
//--------------------------------------------------------------
app.get('/sbt/token/:tokenId', async function(req, res) {
    //let num = req.params.userId;
    const tokenId = req.params.tokenId;
  
    //userId mapping
    //let userAddress = fn_whois(num);
    // userId와 tokenId를 사용하여 필요한 로직 수행
    // 예시: userId와 tokenId에 해당하는 SBT 정보 조회
    const imageURI = await fn_SBT_Info(tokenId);
  
    // 결과 반환
    res.send({ "result" : imageURI });
});
async function fn_SBT_Info(_tokenId) {
    let httpImageURI;

    try {
        const tokenURI = await cerealSBT_contract.methods.tokenURI(_tokenId).call();
    
        // IPFS 프로토콜을 HTTP 프로토콜로 변경
        const httpURI = tokenURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
    
        // HTTP 요청을 보내 JSON 데이터 가져오기
        const response = await axios.get(httpURI);
        const jsonData = response.data;
    
        // image 값 추출
        const imageURI = jsonData.image;
    
        // image URI에서 IPFS 프로토콜을 HTTP 프로토콜로 변경
        httpImageURI = imageURI.replace('ipfs://', 'http://ipfs.io/ipfs/');
        console.log('httpImageURI : '+httpImageURI);
        // 결과 반환
        //res.send({ "result": httpImageURI });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }

    return httpImageURI;
  // 함수 내용
}
//--------------------------------------------------------------
//--------------------------------------------------------------
app.post('/nft/setSaleActive', async function(req, res){
  let flag = req.body.flag;
  
  await fn_setSaleActive(flag);
  
  console.log('over...');
  res.send({"result":true});
});
async function fn_setSaleActive(_flag) {
  // userId 값이 필요하다면 여기에서 사용 가능
  console.log('fn_setSaleActive() 함수가 실행되었습니다.');

  const from = "0x9C64F3c4e8f5804E9be78529c7C76d3b826043bc";
  const nonce = await web3.eth.getTransactionCount(from);
  const networkId = web3.eth.net.getId;
  //abi
  //contractAddress

  // 서명된 트랜잭션을 생성
  const txObject = {
      from: from,
      to: cerealNFT_address,
      nonce: web3.utils.toHex(nonce),
      gasLimit: web3.utils.toHex(800000),
      gasPrice: web3.utils.toHex(1000000000), // 예시로 200000으로 설정
      value: '0x0',
      data: cerealNFT_contract.methods.setSaleActive(_flag).encodeABI()
  };
  const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

  // 서명된 트랜잭션을 블록체인 네트워크로 전송
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log('setSaleActive 함수 호출 성공:', receipt);
  return;
}

// 배치 요청을 위한 설정 정의
const requests = [
  {
    url: 'http://localhost:3000/nft/setSaleActive',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "flag": true }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'silver' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'gold' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'diamond' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'promotion_a' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'promotion_b' }
  },
  {
    url: 'http://localhost:3000/sbt/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'silver' }
  },
  {
    url: 'http://localhost:3000/sbt/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'gold' }
  },
  {
    url: 'http://localhost:3000/sbt/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'B', "type": 'diamond' }
  },
  {
    url: 'http://localhost:3000/sbt/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'C', "type": 'silver' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'C', "type": 'gold' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'C', "type": 'diamond' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'C', "type": 'promotion_b' }
  },
  {
    url: 'http://localhost:3000/sbt/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'D', "type": 'gold' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'D', "type": 'silver' }
  },
  {
    url: 'http://localhost:3000/nft/mint',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { "userId": 'D', "type": 'gold' }
  }
];

// 배치 요청 실행
async function batchRequests() {
  try {
    for (const request of requests) {
      const response = await axios(request);
      console.log(`Request status:`, response.status);
      console.log(`Request data:`, response.data);

      // 지연 시간 추가 (예: 1초)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

let batchFlag = true;
// 배치 요청 실행
if(batchFlag){
  batchRequests();
}