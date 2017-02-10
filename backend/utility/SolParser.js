let fs = require('fs');

let pointer = Symbol('BufferStream::POS');
let pos_begin = Symbol('BufferStream::POS::BEGIN');
let pos_current = Symbol('BufferStream::POS::CURRENT');
let pos_end = Symbol('BufferStream::POS::END');

class StreamReadBuffer{
	constructor(buffer){
		this.buffer=buffer;
		this[pointer] = 0;
	}

	seek(offset=0,pos = pos_current){
		let max = this.buffer.length - 1;

		switch (pos){
			case pos_begin:{
				this[pointer] = offset;
				break;
			}
			case pos_current:{
				this[pointer] += offset;
				break;
			}
			case pos_end:{
				this[pointer] = max - offset;
				break;
			}
		}

		if(this[pointer]<0 || this[pointer]>max){
			throw new RangeError(`Index out of range:0x${this[pointer].toString(16)}`);
		}
		return this[pointer];
	}

	get eof(){
		return this[pointer] >= this.buffer.length;
	}

	read(size){
		let result = this.buffer.slice(this[pointer],this[pointer]+size);
		this[pointer]+=result.length;
		return result;
	}

	peek(size){
		return this.buffer.slice(this[pointer], this[pointer] + size);
	}

	readString(size){
		return this.read(size).toString();
	}

	readDoubleBE(...args) {
		try {
			return this.buffer.readDoubleBE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 8;
		}
	}

	readDoubleLE(...args) {
		try {
			return this.buffer.readDoubleLE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 8;
		}
	}

	readFloatBE(...args) {
		try {
			return this.buffer.readFloatBE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readFloatLE(...args) {
		try {
			return this.buffer.readFloatLE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readInt8(...args) {
		try {
			return this.buffer.readInt8(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 1;
		}
	}

	readInt16BE(...args) {
		try {
			return this.buffer.readInt16BE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 2;
		}
	}

	readInt16LE(...args) {
		try {
			return this.buffer.readInt16LE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 2;
		}
	}

	readInt32BE(...args) {
		try {
			return this.buffer.readInt32BE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readInt32LE(...args) {
		try {
			return this.buffer.readInt32LE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readIntBE(...args) {
		try {
			return this.buffer.readIntBE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 6;
		}
	}

	readIntLE(...args) {
		try {
			return this.buffer.readIntLE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 6;
		}
	}

	readUInt8(...args) {
		try {
			return this.buffer.readUInt8(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 1;
		}
	}

	readUInt16BE(...args) {
		try {
			return this.buffer.readUInt16BE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 2;
		}
	}

	readUInt16LE(...args) {
		try {
			return this.buffer.readUInt16LE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 2;
		}
	}

	readUInt32BE(...args) {
		try {
			return this.buffer.readUInt32BE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readUInt32LE(...args) {
		try {
			return this.buffer.readUInt32LE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 4;
		}
	}

	readUIntBE(...args) {
		try {
			return this.buffer.readUIntBE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 6;
		}
	}

	readUIntLE(...args) {
		try {
			return this.buffer.readUIntLE(this[pointer], ...args);
		}
		catch (e) {
			throw e;
		}
		finally {
			this[pointer] += 6;
		}
	}

	static get BEG(){
		return pos_begin;
	}

	static get CUR() {
		return pos_current;
	}

	static get END(){
		return pos_end;
	}
}

let AMF0_NUMBER = 0,
	AMF0_BOOLEAN = 1,
	AMF0_STRING = 2,
	AMF0_OBJECT = 3,
	AMF0_MOVIECLIP = 4, /* reserved, not used */
	AMF0_NULL = 5,
	AMF0_UNDEFINED = 6,
	AMF0_REFERENCE = 7,
	AMF0_ECMA_ARRAY = 8,
	AMF0_OBJECT_END = 9,
	AMF0_STRICT_ARRAY = 10,
	AMF0_DATE = 11,
	AMF0_LONG_STRING = 12,
	AMF0_UNSUPPORTED = 13,
	AMF0_RECORDSET = 14, /* reserved, not used */
	AMF0_XML_DOC = 15,
	AMF0_TYPED_OBJECT = 16,
	AMF0_AVMPLUS = 17, /* switch to AMF3 */
	AMF0_INVALID = 0xff;

	let AMF0_OBJECT_END_TOKEN = Buffer.from([0x0,0x0, AMF0_OBJECT_END]);

class AMFReader{
	static read(stream_buffer){
		if (stream_buffer.readUInt16BE() != 0xBF) {
			// not a sol file
			return null;
		}

		let data = {};
		data.length = stream_buffer.readUInt32BE(0);

		if(stream_buffer.read(10).compare(Buffer.from([0x54, 0x43, 0x53, 0x4F, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00])) != 0){
			//signature fail
			return null;
		}

		data.name = this.readAMF0String(stream_buffer);
		data.version = stream_buffer.readUInt32BE(0);

		if(data.version == 0){
			data.data = this.readAMF0(stream_buffer);
		}
		else {
			data.data = this.readAMF3(stream_buffer);
		}

		return data;
	}

	static readAMF0String(stream_buffer){
		return stream_buffer.readString(stream_buffer.readUInt16BE(0));
	}

	static readAMF0Value(stream_buffer, in_object=false){
		let value;
		let type = stream_buffer.readUInt8();

		switch (type) {
			case AMF0_NUMBER: {
				value = stream_buffer.readDoubleBE();
				break;
			}
			case AMF0_BOOLEAN: {
				value = !!stream_buffer.readUInt8();
				break;
			}
			case AMF0_STRING: {
				value = this.readAMF0String(stream_buffer);
				break;
			}
			case AMF0_OBJECT: {
				value = this.readAMF0(stream_buffer,true);
				break;
			}
			case AMF0_NULL: {
				value = null;
				break;
			}
			case AMF0_UNDEFINED: {
				value = undefined;
				break;
			}
			default: {
				throw new TypeError(`Unsupported type:${type} in readAMF0 @0x${stream_buffer.seek().toString(16)}`);
			}
		}

		if(!in_object)stream_buffer.read(1);
		return value;
	}

	static readAMF0(stream_buffer, in_object=false){
		let data = {};
		while(!stream_buffer.eof && (!in_object || stream_buffer.peek(3).compare(AMF0_OBJECT_END_TOKEN)!=0)){
			let key = this.readAMF0String(stream_buffer);
			let value = this.readAMF0Value(stream_buffer,in_object);
			data[key]=value;
		}

		if(in_object){
			stream_buffer.read(3);
		}
		return data;
	}
	static readAMF3(stream_buffer){
		throw new Error('AMD3 not supported');
	}
}

class SolParser{
	static parse(file){
		if(!fs.existsSync(file))return null;
		let buffer = new StreamReadBuffer(fs.readFileSync(file));
		return AMFReader.read(buffer);
	}
}

module.exports = SolParser;


