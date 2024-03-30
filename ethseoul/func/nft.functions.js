// functions.js
module.exports = {
  async fn_nft_mint(_targetAddress, _type) {
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


    ,
    async fn_NFT_Info() {
        let httpImageURI;
    
        try {
            const tokenURI = await cerealSBT_contract.methods.tokenURI(tokenId).call();
        
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
  };