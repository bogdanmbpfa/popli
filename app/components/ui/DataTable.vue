<template>
  <div class="ui-data-table" v-bind="$attrs">
    <div v-if="$slots.header" class="table-header">
      <slot name="header" />
    </div>

    <div class="table-wrapper">
      <table>
        <thead v-if="columns.length">
          <tr>
            <th v-for="column in columns" :key="column.field">{{ column.header }}</th>
          </tr>
        </thead>
        <tbody v-if="rows.length">
          <tr v-for="(row, rowIndex) in paginatedRows" :key="getRowKey(row, rowIndex)">
            <td v-for="column in columns" :key="`${getRowKey(row, rowIndex)}-${column.field}`">
              <slot :name="`cell-${column.field}`" :row="row" :value="row[column.field]" :index="rowIndex">
                {{ row[column.field] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!rows.length" class="empty">
        <slot name="empty">No records found.</slot>
      </div>
    </div>

    <div v-if="paginator" class="pager">
      <button type="button" :disabled="page <= 1" @click="page -= 1">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button type="button" :disabled="page >= totalPages" @click="page += 1">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type Row = Record<string, any>;

type Column = {
  field: string;
  header: string;
};

const props = withDefaults(defineProps<{
  value?: Row[];
  columns?: Column[];
  paginator?: boolean;
  rows?: number;
  dataKey?: string;
}>(), {
  value: () => [],
  columns: () => [],
  paginator: false,
  rows: 10,
  dataKey: ''
});

const page = ref(1);
const rows = computed(() => props.value ?? []);
const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / props.rows)));
const paginatedRows = computed(() => {
  if (!props.paginator) return rows.value;
  const start = (page.value - 1) * props.rows;
  return rows.value.slice(start, start + props.rows);
});

const getRowKey = (row: Row, index: number) => (props.dataKey && row[props.dataKey]) || index;
</script>

<style scoped lang="scss">
.ui-data-table {
  .table-wrapper {
    background-color: var(--background-secondary);
    border: 2px solid var(--background-secondary);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    overflow: auto;

    table {
      width: 100%;
      border-collapse: collapse;

      thead {
        th {
          background: none;
          border: none;
          color: var(--neutral-400);
          font-size: 0.875rem;
          font-weight: 400;
          text-align: left;
          padding: 0.75rem;
        }
      }

      tbody {
        tr {
          background-color: var(--background-primary);

          td {
            border-top: 1px solid var(--background-secondary);
            border-bottom: 1px solid var(--background-secondary);
            padding: 0.75rem;
          }

          &:first-child td {
            border-top: none;
          }

          &:last-child td {
            border-bottom: none;
          }

          &:hover {
            background-color: var(--background-secondary);
          }
        }
      }
    }

    .empty {
      padding: 1rem;
      color: var(--neutral-400);
    }
  }

  .pager {
    border: 2px solid var(--background-secondary);
    border-top: none;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    background-color: var(--background-secondary);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.5rem;

    button {
      color: var(--neutral-100);
      background: none;
      border: none;
      cursor: pointer;

      &:disabled {
        color: var(--neutral-400);
      }
    }
  }
}
</style>
