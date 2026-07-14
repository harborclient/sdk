import {
  faChevronDown,
  faChevronRight,
  faCodeBranch,
  faLayerGroup,
  faPersonRunning
} from '@fortawesome/free-solid-svg-icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RowActionsMenu } from '../RowActionsMenu/index.js';
import {
  SidebarCommitItem,
  SidebarDocumentItem,
  SidebarEnvironmentItem,
  SidebarFolderItem,
  SidebarHistoryItem,
  SidebarRequestItem,
  SidebarRunItem,
  SidebarTabGroupItem
} from './index.js';

const meta = {
  title: 'Components/SidebarItem',
  tags: ['autodocs']
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noopMenuGroups = [[{ label: 'Example action', onSelect: fn() }]];

export const RequestItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarRequestItem
        method="GET"
        name="List users"
        selected
        ariaLabel="List users"
        ariaCurrent
        colorDot={{ color: '#32D2E2', visible: true, label: 'Color for List users' }}
        sortable={{ id: 'request-1', dragHandleLabel: 'Reorder request "List users"' }}
        actions={
          <RowActionsMenu
            menuId="request-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const RequestItemGitChange: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarRequestItem
        method="POST"
        name="Create user"
        ariaLabel="Create user, modified"
        statusMarker={{ marker: 'M', className: 'text-git-uncommitted', label: 'Modified' }}
        as="li"
        actions={
          <RowActionsMenu
            menuId="git-change-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={[[{ label: 'Revert changes', variant: 'danger', onSelect: fn() }]]}
          />
        }
      />
    </div>
  )
};

export const DocumentItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarDocumentItem
        name="README"
        selected
        ariaLabel="README"
        ariaCurrent
        colorDot={{ color: '#0f2e56', visible: true, label: 'Color for README' }}
        actions={
          <RowActionsMenu
            menuId="document-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const FolderItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarFolderItem
        name="Auth"
        expanded
        selected
        dropHighlighted
        expandIcon={faChevronRight}
        collapseIcon={faChevronDown}
        onToggleExpand={fn()}
        onNameClick={fn()}
        sortable={{ id: 'folder-1', dragHandleLabel: 'Reorder folder "Auth"' }}
        colorDot={{ color: '#92a8b8', visible: true, label: 'Color for Auth' }}
        actions={
          <RowActionsMenu
            menuId="folder-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const RunItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarRunItem
        method="GET"
        label="Smoke test"
        connectionBadge="Local"
        statusDotClassName="bg-success"
        statusSummary="All passed"
        ariaLabel="Smoke test"
        actions={
          <RowActionsMenu
            menuId="run-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const HistoryItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarHistoryItem
        method="GET"
        name="https://api.example.com/users"
        status={200}
        statusText="OK"
        ariaLabel="GET request"
        actions={
          <RowActionsMenu
            menuId="history-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const HistoryRunItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarHistoryItem
        method="RUN"
        name="Collection runner"
        isRun
        runIcon={faPersonRunning}
        ariaLabel="Run history entry"
        actions={
          <RowActionsMenu
            menuId="history-run-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const EnvironmentItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarEnvironmentItem
        name="Production"
        variableSummary="12 variables"
        ariaLabel="Production, 12 variables"
        ariaCurrent
        colorDot={{ color: '#e74c3c', visible: true, label: 'Color for Production' }}
        sortable={{ id: 'env-1', dragHandleLabel: 'Reorder environment "Production"' }}
        actions={
          <RowActionsMenu
            menuId="env-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const TabGroupItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarTabGroupItem
        name="API review"
        summary="4 tabs"
        icon={faLayerGroup}
        colorDot={{ color: '#32D2E2', visible: true, label: 'Color for API review' }}
        sortable={{ id: 'tab-group-1', dragHandleLabel: 'Reorder tab group "API review"' }}
        actions={
          <RowActionsMenu
            menuId="tab-group-1"
            openMenuId={null}
            onOpenChange={fn()}
            groups={noopMenuGroups}
          />
        }
      />
    </div>
  )
};

export const CommitItem: Story = {
  render: () => (
    <div className="w-72 rounded-md border border-separator bg-sidebar p-2">
      <SidebarCommitItem
        message="Fix auth header handling"
        author="Alex"
        timestampLabel="Jul 14, 2026, 10:00 AM"
        icon={faCodeBranch}
        onClick={fn()}
      />
    </div>
  )
};
