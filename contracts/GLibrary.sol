// SPDX-License-Identifier: MIT
pragma solidity ^0.6.1;

library GLibrary{
    enum GardenType{Vegetable, Hobby}
    enum Status{Waiting,Free,Blocked,CodeWaiting,Location,Blacklist,Dispute}
    struct Garden{
        address payable owner;
        bool multipleOwners;
        address payable[] coOwners;
        GardenType gardenType;
        string district;
        uint32 area;
        uint[2] secretHash;
        string contact;
        Status status;
        Rent[] rents;
    }
    struct Rent{
        int rate;
        uint duration;
        uint price;
        uint beginning;
        uint balance;
        address payable tenant;
        AccessCode accessCode;
    }
    struct AccessCode{
        string hashCode;
        string encryptedCode;
    }

    function IsRentOver(uint _beginning, uint _duration) public view returns (bool){
        if(_beginning + _duration<= block.timestamp){
            return true;
        }
        return false;
    }
}
