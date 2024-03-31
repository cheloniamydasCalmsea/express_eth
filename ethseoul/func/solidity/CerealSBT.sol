// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract CerealSBT is ERC721, IERC5192, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => bool) private _tokenIsLocked;
    mapping(uint256 => address) private _soulboundOwners;
    mapping(uint256 => string) public tokenReferKey;
    mapping(address => uint256[]) private _ownedTokens;
    string baseURI;
    mapping(uint256 => string) tokenMetadataNo;

    event TokenMinted(address indexed owner, uint256 indexed tokenId, string memo);
    event TokenOwnerChanged(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() ERC721("CerealPlanet", "Cereal_SBT") Ownable(msg.sender) {
        baseURI = "ipfs://QmdqtNZBvrN6zRLnrFham2i82D3eWsq7N3sT19FVLhTbUe/";
    }

    function mint(address to, string memory _memo) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _soulboundOwners[tokenId] = to;
        _tokenIsLocked[tokenId] = true;
        tokenReferKey[tokenId] = _memo;
        _ownedTokens[to].push(tokenId);
        tokenMetadataNo[tokenId] = _memo;
        _tokenIdCounter.increment();

        emit TokenMinted(to, tokenId, _memo);
        emit Locked(tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_tokenIsLocked[tokenId] == false, "token is Lock");
        require(_soulboundOwners[tokenId] == from, "SoulboundToken: token is soulbound");
        changeTokenOwner(from, to, tokenId);
        super.transferFrom(from, to, tokenId);

        emit TokenOwnerChanged(from, to, tokenId);
    }

    function getSoulboundOwner(uint256 tokenId) public view returns (address) {
        return _soulboundOwners[tokenId];
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        require(_tokenIsLocked[tokenId] == false, "token is Lock");
        super.safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_tokenIsLocked[tokenId] == false, "token is Lock");
        transferFrom(from, to, tokenId);
        super._checkOnERC721Received(from, to, tokenId, data);
    }

    function setTokenIsLocked(uint256 _tokenId, bool _flag) external onlyOwner {
        _tokenIsLocked[_tokenId] = _flag;
        if (_flag) {
            emit Locked(_tokenId);
        } else {
            emit Unlocked(_tokenId);
        }
    }

    function locked(uint256 tokenId) external view override returns (bool) {
         try this.ownerOf(tokenId) returns (address) {
                return _tokenIsLocked[tokenId];
        } catch {
            revert("Token does not exist");
        }
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(baseURI, tokenMetadataNo[tokenId]);
    }
}