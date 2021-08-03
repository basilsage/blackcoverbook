// SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0 <0.9.0;

contract Alexandria {
  string public name = "Alexandria";

  // Store posts
  uint public postCount = 0;
  mapping(uint => Post) public posts; 

  struct Post {
    uint id;
    string imageHash;
    string postHash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event PostCreated(
    uint id,
    string imageHash,
    string postHash,
    string description,
    uint tipAmount,
    address payable author
  );

  event PostTipped(
    uint id,
    string imageHash,
    string postHash,
    string description,
    uint tipAmount,
    address payable author
  );

  // Create posts

  function uploadPost(string memory _imageHash, string memory _description, string memory _postHash) public {

    // Make sure post + image hashes exists
    require(bytes(_imageHash).length > 0); 
    require(bytes(_postHash).length > 0); 

    // Make sure post description exists
    require(bytes(_description).length > 0); 

    // Make sure uploader addresss exists
    require(msg.sender != address(0x0)); 

    // Increment post id
    postCount = postCount + 1;

    // Add post to contract
    posts[postCount] = Post(postCount, _imageHash, _postHash,  _description, 0, payable(msg.sender)); 

    // Trigger event
    emit PostCreated(postCount, _imageHash, _postHash, _description, 0, payable(msg.sender));
  }


  // Tip posts
  function tipPostAuthor(uint _id) public payable {
    
    // Make sure id is valid
    require(_id > 0 && _id <= postCount);

    // Fetch post 
    Post memory _post = posts[_id];

    // Fetch author
    address payable _author = _post.author;

    // Pay author by sending them ether
    _author.transfer(msg.value);

    // Increment the tip amount
    _post.tipAmount = _post.tipAmount + msg.value;

    // Update the post
    posts[_id] = _post;

    // Trigger an event
    emit PostTipped(_id, _post.postHash, _post.imageHash, _post.description, _post.tipAmount, _author);

  }

} 