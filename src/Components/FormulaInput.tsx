import { useEffect, useState } from "react";
import { rowData } from "../Utils/data";
import { getTokens } from "../Utils/lexar";
import { ErrorType } from "../Utils/types";
import { getValidationErrors } from "../Utils/validator";
import "./FormulaInput.css";

export function FormulaInput() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [errorStr, setErrorStr] = useState<string>("");
  const [formula, setFormula] = useState<string>(
    `min($transformation_unit_price, $storage_unit_price)`
  );

  useEffect(() => {
    const tokens = getTokens(formula);
    const errors = getValidationErrors(tokens,Object.keys(rowData));
    let errorString = "";
    let invalidCharacter = "";
    for(let i=0;i<errors.length;i++){
      if(errors[i].errorType === ErrorType.InvalidCharacter){
        while(i< errors.length && errors[i].errorType === ErrorType.InvalidCharacter){
          invalidCharacter += errors[i]?.token?.value; 
          i++;
        }
      }
        errorString+= errors[i]?.message ? errors[i]?.message : (invalidCharacter!=="" ? `Invalid "${invalidCharacter}"` : `${errors[i].errorType} '${errors[i]?.token?.value}'`);
        invalidCharacter = "";
        if(i< errors.length -1){
            errorString+=" , ";
        }
    }
    setTokens(tokens);
    setErrors(errors);
    setErrorStr(errorString);

  }, [formula]);


  const textareaOnChange = (e:any) => {
    let v = e.target.value;
    if (v) {
      v = v.replace(/(?:\r\n|\r|\n)/g, "");
    }
    setFormula(v);
  };

  return (
    <div className="formula-editor">
      <h2 className="heading">Enter your Formula below: </h2>
      <textarea
        value={formula}
        onChange={textareaOnChange}
        className="formula-editor-textarea"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        rows={2}
      />

        {errors.length>0 && 
            <div className="errorBox error" data-testid="errorDiv">
            {errorStr}
            </div>
        }

      <h2 className="heading mt-5">Syntax Checker</h2>
      <div className="formula-editor-formatted">
        {checkSyntaxAndApplyColors(tokens, errors)}
      </div>

      <h2 className="heading mt-5">Supported variables List</h2>
      <table className="customers">
        <thead>
        <tr>
            <th>Reference Keys</th>
            <th>Reference Values</th>
        </tr>
        </thead>
        <tbody>
        {Object.keys(rowData).map((key)=><tr key={key}>
            <td>{key}</td>
            <td>{rowData[key]}</td>
        </tr>)}
        </tbody>
     </table>
    </div>
  );
}

function checkSyntaxAndApplyColors(tokens:any[], errors:any[]) {
  let formattedText = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const classNames = [token.type];

    const errorsForToken = errors.filter((x) => x.token === token);
    if (errorsForToken.length > 0) {
      classNames.push("error-syntax");
    }

    formattedText.push(
      <span key={i} className={classNames.join(" ")}>
        {token.value}
      </span>
    );
  }

  return formattedText;
}
