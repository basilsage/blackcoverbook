pragma solidity >= 0.5.0 <0.9.0;

contract Decentragram {
  string public name = "Decentragram";

  // Store posts
  uint public postCount = 0;
  mapping(uint => Post) public posts; 

  struct Post {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event PostCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  event PostTipped(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  // Create posts

  function uploadPost(string memory _postHash, string memory _description) public {

    // Make sure post hash exists
    require(bytes(_postHash).length > 0); 

    // Make sure post description exists
    require(bytes(_description).length > 0); 

    // Make sure uploader addresss exists
    require(msg.sender != address(0x0)); 

    // Increment post id
    postCount = postCount + 1;

    // Add post to contract
    posts[postCount] = Post(postCount, _postHash,  _description, 0, msg.sender); //msg.sender = account sending the request

    // Trigger event
    emit PostCreated(postCount, _postHash, _description, 0, msg.sender);
  }


  // Tip posts
  function tipImageOwner(uint _id) public payable {
    
    // Make sure id is valid
    require(_id > 0 && _id <= postCount);

    // Fetch post 
    Post memory _post = posts[_id];

    // Fetch author
    address payable _author = _post.author;

    // Pay author by sending them ether
    _author.transfer(msg.value);
    // THIS MAY BE WHERRE BUG IS, I CHANGED AT 1:02 of tutorial

    // Increment the tip amount
    _post.tipAmount = _post.tipAmount + msg.value;

    // Update the post
    posts[_id] = _post;

    // Trigger an event
    emit PostTipped(_id, _post.hash, _post.description, _post.tipAmount, _author);

  }

} 