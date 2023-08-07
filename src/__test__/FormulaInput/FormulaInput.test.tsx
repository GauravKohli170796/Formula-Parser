import { rowData } from "../../Utils/data";
import { getTokens } from "../../Utils/lexar";
import { getValidationErrors } from "../../Utils/validator";
import { passingTestInputs } from "./testInputs";

describe("FormulaInput Component",()=>{

   test("Should test the formula input with all posible inputs and return no error",()=>{
   for( const input of passingTestInputs){
     const tokens = getTokens(input);
    const errors = getValidationErrors(tokens,Object.keys(rowData));
    expect(errors.length).toBe(0);
    
   }
       
    });
    
});