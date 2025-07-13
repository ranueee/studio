// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;
// OpenZeppelin v4.8.3 URLs (compatible with ^0.8.0 up to 0.8.17)

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/utils/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/utils/Address.sol";

// IVRC25 interface (remove ERC20-like functions from here to avoid clash)
interface IVRC25 {
    event Fee(address indexed from, address indexed to, address indexed issuer, uint256 amount);

    function issuer() external view returns (address);
    function estimateFee(uint256 value) external view returns (uint256);
}

// A simple VRC25-like token for demonstration
contract SimpleVRC25Token is ERC20, Ownable, IVRC25 {

    using SafeMath for uint256;
    using Address for address;

    uint256 private _minFee;

    // The order of _balances, _minFee, _owner MUST NOT be changed for gas sponsor validation [73]
    // mapping (address => uint256) private _balances; // Handled by ERC20 from OpenZeppelin

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 minFee_
    )
        ERC20(name_, symbol_)
        Ownable() // Pass initial owner to Ownable
    {
        _minFee = minFee_;
        _customDecimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    // Custom decimals storage
    uint8 private _customDecimals;

    // Override decimals to use custom value
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    function issuer() public view override returns (address) {
        return owner();
    }

    function minFee() public view returns (uint256) {
        return _minFee;
    }

    function setMinFee(uint256 newMinFee) public onlyOwner {
        _minFee = newMinFee;
    }

    function estimateFee(uint256 value) public view override returns (uint256) {
        // Example: 0.1% of value + minFee
        return value.div(1000).add(_minFee);
    }

    function isContract(address account) public view returns (bool){
         return account.code.length > 0; 
    }

    function _chargeFeeFrom(address sender, uint256 amount) internal {
        if (isContract(sender)) return;
        if (amount > 0) {
            super._transfer(sender, owner(), amount);
            emit Fee(sender, address(0), owner(), amount);
        }
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        uint256 fee = estimateFee(amount);
        uint256 totalAmount = amount.add(fee);

        require(balanceOf(_msgSender()) >= totalAmount, "VRC25: not enough tokens for transfer and fee");

        _chargeFeeFrom(_msgSender(), fee);
        super._transfer(_msgSender(), recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        uint256 fee = estimateFee(0);

        require(balanceOf(_msgSender()) >= fee, "VRC25: not enough tokens for approval fee");

        _chargeFeeFrom(_msgSender(), fee);
        super._approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        uint256 fee = estimateFee(amount);
        uint256 totalAmount = amount.add(fee);

        require(allowance(sender, _msgSender()) >= totalAmount, "VRC25: not enough allowance for transfer and fee");
        require(balanceOf(sender) >= totalAmount, "VRC25: not enough tokens for transfer and fee");

        _chargeFeeFrom(sender, fee);
        super._transfer(sender, recipient, amount);
        super._approve(sender, _msgSender(), allowance(sender, _msgSender()).sub(totalAmount));
        return true;
    }
}