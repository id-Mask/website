import 'dotenv/config';
import { Field, Signature, CircuitString, Bool } from 'o1js';
declare const verifyOracleData: (name: CircuitString, surname: CircuitString, country: CircuitString, pno: CircuitString, currentDate: CircuitString, signature: Signature) => Bool;
declare const parseDateFromPNO: (pno: CircuitString) => Field[];
declare const parseDateFromDateString: (currentDate: CircuitString) => Field[];
declare const zkOracleResponseMock: () => {
    data: {
        name: string;
        surname: string;
        country: string;
        pno: string;
        currentDate: string;
    };
    signature: any;
    publicKey: string;
};
export { verifyOracleData, parseDateFromPNO, parseDateFromDateString, zkOracleResponseMock, };
