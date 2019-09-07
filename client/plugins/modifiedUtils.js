
if (String) {
  String.prototype.isEmpty = String.prototype.isEmpty || function () {
    return !(this.trim().length)
  }
  String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement)
  }
}
