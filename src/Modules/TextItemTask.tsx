import type { ReactElement } from "react";

type Props = {
    lazyProps : any,
};
export default function TextItem({lazyProps}:Props): ReactElement {
    return(
        <span className={"w-11/12 text-wrap" + lazyProps.classString} dangerouslySetInnerHTML={{ __html: lazyProps.label}}/>
    );
}