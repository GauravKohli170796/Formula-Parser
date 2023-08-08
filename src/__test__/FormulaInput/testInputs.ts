
export const passingTestInputs = [
    "min($transformation_unit_price, $storage_unit_price)",
    "sum($transformation_unit_price, $storage_unit_price)",
    "$storage_unit_price * $bandwidth_unit_price * $transformation_unit_price",
    "if(1000>20){return [$total_unit_price]} else if($total_unit_price>20){return [$total_unit_price]} else {return [$storage_unit_price]}",
    "lookup($transformation_unit_price){$transformation_unit_price * $storage_unit_price * $bandwidth_unit_price}",
    "lookup($transformation_unit_price ){$transformation_unit_price > $storage_unit_price OR $storage_unit_price > $bandwidth_unit_price}",
    "lookup($transformation_unit_price ){($transformation_unit_price >= $storage_unit_price) or ($storage_unit_price > $bandwidth_unit_price)}"
];