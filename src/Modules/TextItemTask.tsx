import type { ReactElement } from "react";

type Props = {
    lazyProps : any,
};
export default function TextItem({lazyProps}:Props): ReactElement {
    return(
        <span className={lazyProps.classString} dangerouslySetInnerHTML={{ __html: lazyProps.label}}/>
    );
}