const Queue = function(size){
    return{
        _size: size,
        _array: [],
        add: function(el){
            if (this._array < this._size){
                this._array.push(el);
            } else {
                this._array.push(el);
                this._array.shift();
            }
        },
        mean: function(){
            return this._array.reduce((pv,cv) => cv/this._array.length + pv)
        }
    }
}

export default Queue;

