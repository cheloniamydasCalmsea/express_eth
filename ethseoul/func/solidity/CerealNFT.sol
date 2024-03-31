// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CerealNFT is ERC721, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    using Strings for uint256;
    uint256 MAX_SUPPLY;
    bool public isSalesActive;
    string baseURI;
    
    mapping(address => uint256[]) private _ownedTokens;

    mapping(uint256 => string) tokenMetadataNo;

    constructor () ERC721("CerealNFT", "Cereal_NFT") Ownable(msg.sender){
        MAX_SUPPLY = 100; // 예시로 MAX_SUPPLY를 100으로 설정
        baseURI = "ipfs://QmfMYWTm3maZF5cDNKfwn25dnNedL19MUnay3tyS3b2wW4/";
    }

    function setSaleActive(bool _flag) external onlyOwner{
        isSalesActive = _flag;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    function mintPlanet(address _targetAddress, string memory _type) external onlyOwner {
        require(isSalesActive, "not on sale");
        require(keccak256(bytes(_type)) != keccak256(bytes("")), "_type should not be null");
        require(_tokenIdCounter.current() <= MAX_SUPPLY, "max supply exceeded");

        uint256 tokenType;

        
        uint256 tokenId = _tokenIdCounter.current();
        _ownedTokens[_targetAddress].push(tokenId);

        tokenMetadataNo[tokenId] = _type;
        _safeMint(_targetAddress, tokenId);


        _tokenIdCounter.increment();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(baseURI, tokenMetadataNo[tokenId]);
    }

    function withDraw() external onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
    }

    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function changeTokenOwner(address from, address to, uint256 tokenId) private {
        uint256 index = findTokenIndex(_ownedTokens[from], tokenId);
        _ownedTokens[from][index] = _ownedTokens[from][_ownedTokens[from].length - 1];
        _ownedTokens[from].pop();
        _ownedTokens[to].push(tokenId);
    }

    function findTokenIndex(uint256[] memory tokens, uint256 tokenId) private pure returns (uint256) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token not found");
    }

    

}