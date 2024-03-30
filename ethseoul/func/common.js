// functions.js
module.exports = {
    fn_whois(_num) {
        // _num = parseInt(_num); 
        console.log("_num : "+_num);
        let userAddress;

        switch (_num) {
            case "A":
                console.log("숫자 1을 처리합니다.");
                // 여기에 숫자 1을 처리하는 코드를 추가합니다.
                userAddress = "0x2148B78C48D78A1D8C9A0C314A90b46F113B460d";
                break;
            case "B":
                console.log("숫자 2를 처리합니다.");
                // 여기에 숫자 2를 처리하는 코드를 추가합니다.
                userAddress = "0x632F2032d8E53c3A5F51f3100b73463259Caa1a3";
                break;
            case "C":
                console.log("숫자 3을 처리합니다.");
                // 여기에 숫자 3을 처리하는 코드를 추가합니다.
                userAddress = "0xF9bf08d8d1f86799D766A12CB32ACEa5b16D410d";
                break;
            case "D":
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
  };