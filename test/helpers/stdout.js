
class StdoutCapture {
  write(l) {
    this.output.push(l)
  }
  capture() {
    this.output = [];
    this._originalWrite = process.stdout.write;
    process.stdout.write = this.write.bind(this);
  }
  stop() {
    process.stdout.write = this._originalWrite;
    return this.output;
  }
}

module.exports = StdoutCapture;
