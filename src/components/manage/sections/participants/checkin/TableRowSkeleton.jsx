export const TableRowSkeleton = ({ columns = 9 }) => (
    <tr className="animate-pulse">
        {[...Array(columns)].map((_, i) => (
            <td key={i} className="p-4 whitespace-nowrap">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
            </td>
        ))}
    </tr>
);