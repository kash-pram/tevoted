function naturalSort(as, bs){
  var a, b, a1, b1, i= 0, n, L,
  rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
  if(as=== bs) return 0;
  a= typeof as === 'string' ? as.toLowerCase().match(rx) : as.toString().match(rx);
  b= typeof bs === 'string' ? bs.toLowerCase().match(rx) : bs.toString().match(rx);
  L= a.length;
  while(i<L){
    if(!b[i]) return 1;
    a1= a[i],
    b1= b[i++];
    if(a1!== b1){
      n= a1-b1;
      if(!isNaN(n)) return n;
      return a1>b1? 1:-1;
    }
  }
  return b[i]? -1:0;
}

var naturalSortBy = function(field, reverse, primer){

  var key = primer ? 
    function(x) {return primer(x[field])} : 
    function(x) {return x[field]};

  reverse = !reverse ? 1 : -1;

  return function (as, bs) {
    var a, b, a1, b1, i= 0, n, L,
    rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    as = key(as)
    bs = key(bs)
    if(as === bs) return 0;
    a= typeof as === 'string' ? as.toLowerCase().match(rx) : as.toString().match(rx);
    b= typeof bs === 'string' ? bs.toLowerCase().match(rx) : bs.toString().match(rx);
    L= a.length;
    while(i<L){
      if(!b[i]) return 1;
      a1= a[i],
      b1= b[i++];
      if(a1!== b1){
        n= a1-b1;
        if(!isNaN(n)) return reverse * n;
        return a1>b1 ? reverse * 1:reverse * -1;
      }
    }
    return b[i]? reverse * -1:0;
  } 
}