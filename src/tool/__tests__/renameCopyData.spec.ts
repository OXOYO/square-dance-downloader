import {fixFileOrDirName} from "../renameCopyData";

describe('renameCopyData',()=>{
    it('fixFileOrDirName',()=>{
        expect(fixFileOrDirName('?胜多负少')).toBe('胜多负少');
    });
})