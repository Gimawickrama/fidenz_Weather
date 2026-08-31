import {
  Database,
} from "lucide-react";

function CacheStatus() {

  return (
    <div className="mobile-cache">

      <div className="mobile-cache-header">

        <Database size={20} />

        <strong>
          Cache Status
        </strong>

      </div>


      <div className="mobile-cache-row">

        <span>
          API Cache (5 min)
        </span>

        <strong>
          HIT
        </strong>

      </div>


      <div className="mobile-cache-row">

        <span>
          Processed Cache (5 min)
        </span>

        <strong>
          HIT
        </strong>

      </div>

    </div>
  );
}

export default CacheStatus;